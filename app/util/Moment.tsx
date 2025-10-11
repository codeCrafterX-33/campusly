export function Moment(date: string) {
  if (!date) return "just now";

  const now = new Date();
  const past = new Date(date);

  // Check if the date is valid
  if (isNaN(past.getTime())) {
    return "just now";
  }

  const diffInSeconds = (now.getTime() - past.getTime()) / 1000;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInSeconds / 3600);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInSeconds < 60) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;

  const optionsThisYear: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const optionsPastYear: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return past.getFullYear() === now.getFullYear()
    ? past.toLocaleDateString("en-US", optionsThisYear)
    : past.toLocaleDateString("en-US", optionsPastYear);
}
export function MomentWithTime(date: string) {
  if (!date) return "just now";

  const now = new Date();
  const past = new Date(date);

  // Check if the date is valid
  if (isNaN(past.getTime())) {
    return "just now";
  }

  const diffInSeconds = (now.getTime() - past.getTime()) / 1000;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInSeconds / 3600);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInSeconds < 60) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;

  return past.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
