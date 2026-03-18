'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateUser } from '@/features/dashboard/actions'
import { Select } from '@/components/ui/Select'
import type { UserRole } from '@/types/enums'

interface Props {
    userId: string
    currentRole: UserRole
}

export function UserRoleSelect({ userId, currentRole }: Props) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        startTransition(async () => {
            await updateUser(userId, { role: e.target.value as UserRole })
            router.refresh()
        })
    }

    return (
        <Select value={currentRole} onChange={handleChange} disabled={isPending} className="w-24 text-xs">
            <option value="user">User</option>
            <option value="author">Author</option>
            <option value="admin">Admin</option>
        </Select>
    )
}
