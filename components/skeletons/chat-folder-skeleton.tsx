import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';

const SubjectDetailsSkeleton = () => {
    return (
        <div className="w-full max-w-[400px]  rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
                <Skeleton className="h-5 w-28" />
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* List */}
            <div className="px-6 pb-6">
                <div className="space-y-1">
                    {[...Array(5)].map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg"
                        >
                            {/* Left side - Icon and content */}
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {/* Icon skeleton */}
                                <Skeleton className="w-8 h-8 rounded" />

                                {/* Text content */}
                                <div className="flex-1 min-w-0">
                                    <Skeleton className="h-4 mb-2" style={{ width: `${Math.random() * 40 + 60}%` }} />
                                    <Skeleton className="h-3" style={{ width: `${Math.random() * 30 + 50}%` }} />
                                </div>
                            </div>

                            {/* Right side - Time and menu */}
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <Skeleton className="h-3 w-14" />
                                <Skeleton className="h-4 w-4 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubjectDetailsSkeleton;