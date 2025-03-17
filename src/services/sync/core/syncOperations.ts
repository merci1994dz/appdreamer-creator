
/**
 * وظيفة المزامنة الرئيسية - محسنة مع آلية قفل آمنة ومعالجة الطوابير
 * Main synchronization function - enhanced with safe locking mechanism and queue handling
 */

import { setIsSyncing } from '../../dataStore';
import { isSyncLocked, setSyncLock, releaseSyncLock, addToSyncQueue } from '../lock';
import { setSyncActive } from '../status';
import { getSkewProtectionParams } from '../remoteSync';
import { checkBladiInfoAvailability } from '../remoteSync';
import { createTimeoutPromise } from './helpers/timeoutHelper';
import { executeSync } from './helpers/syncExecutor';
import { syncWithLocalData } from '../local';

// Re-export the performInitialSync function from initialSync.ts
export { performInitialSync } from './initialSync';

/**
 * وظيفة المزامنة الرئيسية - محسنة مع آلية قفل آمنة ومعالجة الطوابير
 * Main synchronization function - enhanced with safe locking mechanism and queue handling
 */
export const syncAllData = async (forceRefresh = false): Promise<boolean> => {
  // إذا كانت المزامنة قيد التنفيذ، إضافة الطلب إلى الطابور
  // If synchronization is already in progress, add the request to the queue
  if (isSyncLocked()) {
    console.log('المزامنة قيد التنفيذ بالفعل، إضافة الطلب إلى الطابور / Sync already in progress, adding request to queue');
    
    // إضافة الوظيفة إلى الطابور (إعادة استدعاء النفس)
    // Add function to queue (calling itself)
    return addToSyncQueue(() => syncAllData(forceRefresh));
  }
  
  // وضع قفل المزامنة
  // Set sync lock
  setSyncLock();
  setIsSyncing(true);
  setSyncActive(true);
  
  try {
    console.log('بدء عملية المزامنة، الوضع الإجباري = / Starting sync process, force mode =', forceRefresh);
    
    // إضافة معامل لمنع التخزين المؤقت (cache-busting) مع دعم حماية التزامن
    // Add cache-busting parameter with sync protection support
    const skewParam = getSkewProtectionParams();
    const cacheBuster = `?_=${Date.now()}&nocache=${Math.random().toString(36).substring(2, 15)}`;
    const fullCacheBuster = skewParam ? `${cacheBuster}&${skewParam}` : cacheBuster;
    
    // تحديد مهلة زمنية للمزامنة لمنع التعليق إلى ما لا نهاية - زيادة إلى 60 ثانية
    // Set timeout for sync to prevent hanging indefinitely - increased to 60 seconds
    const timeoutPromise = createTimeoutPromise(60000);
    
    // التحقق من وجود مصدر متاح
    // Check for available source
    console.log('التحقق من وجود مصدر متاح للمزامنة... / Checking for available sync source...');
    const availableSource = await checkBladiInfoAvailability();
    if (availableSource) {
      console.log(`تم العثور على مصدر متاح: / Found available source: ${availableSource}`);
    } else {
      console.warn('لم يتم العثور على أي مصدر متاح، سيتم استخدام الخطة البديلة / No available source found, will use fallback plan');
    }
    
    // محاولة المزامنة مع مواقع Bladi Info أولاً
    // Try to sync with Bladi Info sites first
    const syncPromise = executeSync(availableSource, forceRefresh, fullCacheBuster, skewParam);
    
    // تنفيذ المزامنة مع مهلة زمنية
    // Execute sync with timeout
    const result = await Promise.race([syncPromise, timeoutPromise]);
    return result;
    
  } catch (error) {
    console.error('خطأ غير متوقع أثناء المزامنة: / Unexpected error during sync:', error);
    
    // محاولة استخدام البيانات المحلية في حالة الخطأ
    // Try to use local data in case of error
    try {
      return await syncWithLocalData(false);
    } catch (e) {
      console.error('فشل الرجوع للبيانات المحلية: / Failed to fallback to local data:', e);
      return false;
    }
  } finally {
    // تحرير قفل المزامنة دائمًا حتى في حالة الخطأ
    // Always release sync lock even in case of error
    releaseSyncLock();
    setIsSyncing(false);
    setSyncActive(false);
  }
};
