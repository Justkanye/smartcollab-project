import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-24' />
        <Skeleton className='h-10 w-32' />
      </div>
      <div className='flex items-center space-x-4'>
        <Skeleton className='h-10 flex-1' />
        <Skeleton className='h-10 w-32' />
        <Skeleton className='h-10 w-32' />
      </div>
      <div className='space-y-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-6 w-3/4' />
              <Skeleton className='h-4 w-full' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-4 w-full mb-2' />
              <Skeleton className='h-4 w-2/3' />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
