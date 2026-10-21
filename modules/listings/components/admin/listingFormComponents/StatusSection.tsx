"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StatusSection = () => {
  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Section Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Dropdown */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Status <span className="text-destructive">*</span>
          </Label>
          <Select defaultValue="active">
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Active</span>
                </div>
              </SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Pending</span>
                </div>
              </SelectItem>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>Draft</span>
                </div>
              </SelectItem>
              <SelectItem value="rejected">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Rejected</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Featured Listing Switch Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
          <div className="space-y-0.5">
            <Label
              htmlFor="featured-toggle"
              className="text-sm font-medium cursor-pointer"
            >
              Featured listing
            </Label>
            <p className="text-xs text-muted-foreground">
              This listing will be shown in the featured section.
            </p>
          </div>
          <Switch id="featured-toggle" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusSection;
