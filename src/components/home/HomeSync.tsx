
import React, { useState } from 'react';
import { syncWithBladiInfo } from '@/services/sync';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HomeSyncProps {
  refetchChannels: () => Promise<any>;
}

const HomeSync: React.FC<HomeSyncProps> = ({ refetchChannels }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // مزامنة القنوات مع مصادر BLADI
  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      toast({
        title: "جاري المزامنة",
        description: "جاري جلب أحدث القنوات من المصادر الخارجية..."
      });
      
      const result = await syncWithBladiInfo(true);
      
      if (result) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: "تم تحديث القنوات بنجاح"
        });
        
        // إعادة تحميل القنوات
        await refetchChannels();
      } else {
        toast({
          title: "تعذرت المزامنة",
          description: "لم يتم العثور على تحديثات جديدة",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("خطأ في المزامنة:", error);
      toast({
        title: "خطأ في المزامنة",
        description: "تعذر الاتصال بمصادر البيانات الخارجية",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
      className="flex items-center gap-1"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      <span>تحديث</span>
    </Button>
  );
};

export default HomeSync;
