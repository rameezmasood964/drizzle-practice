"use client";

import Image from "next/image";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Star,
  ImageIcon,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ListingsTableProps } from "@/modules/listings/types";



// Status ke semantic variants ke liye mapping
const getStatusBadgeVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "approved":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
};

const ListingsTable = ({ listings = [] }: ListingsTableProps) => {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {/* 1. Checkbox */}
            <TableHead className="w-[48px] px-4">
              <Checkbox aria-label="Select all" />
            </TableHead>

            {/* 2. Thumbnail */}
            <TableHead className="w-[80px]">Image</TableHead>

            {/* 3. Title */}
            <TableHead className="min-w-[200px]">Listing Name</TableHead>

            {/* 4. Category */}
            <TableHead>Category</TableHead>

            {/* 5. Status */}
            <TableHead>Status</TableHead>

            {/* 6. Created Date */}
            <TableHead>Created At</TableHead>

            {/* 7. Actions */}
            <TableHead className="w-[70px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {listings.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-muted-foreground"
              >
                No listings found.
              </TableCell>
            </TableRow>
          ) : (
            listings.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                {/* 1. Row Checkbox */}
                <TableCell className="px-4">
                  <Checkbox aria-label={`Select ${item.title}`} />
                </TableCell>

                {/* 2. Image / Thumbnail */}
                <TableCell>
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {item.primaryImage ? (
                      <Image
                        src={item.primaryImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>

                {/* 3. Listing Name + Badges */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">
                        {item.title}
                      </span>

                      {/* Verified Badge */}
                      {item.isVerified && (
                        <span title="Verified Business">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </span>
                      )}

                      {/* Featured Badge */}
                      {item.isFeatured && (
                        <span title="Featured Listing">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* 4. Category Badge */}
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {item.categories.name}
                  </Badge>
                </TableCell>

                {/* 5. Status Badge */}
                <TableCell>
                  <Badge
                    variant={getStatusBadgeVariant(item.status)}
                    className="capitalize"
                  >
                    {item.status}
                  </Badge>
                </TableCell>

                {/* 6. Created At */}
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>

                {/* 7. Actions Dropdown */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* View Option */}
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </DropdownMenuItem>

                      {/* Edit Option */}
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <Pencil className="h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Delete Option */}
                      <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ListingsTable;
