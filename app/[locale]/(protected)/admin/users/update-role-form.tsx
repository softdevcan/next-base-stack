"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { updateUserRoleAction } from "./actions";

export function UpdateRoleForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("role", role);

    const result = await updateUserRoleAction(formData);

    if (result.success) {
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="moderator">Moderator</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      {role !== currentRole && (
        <Button size="sm" onClick={handleUpdate} disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </Button>
      )}
    </div>
  );
}
