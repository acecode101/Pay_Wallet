import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  className?: string;
}

export function UserAvatar({ firstName, lastName, className }: UserAvatarProps) {
  const initials = getInitials(firstName, lastName);

  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
