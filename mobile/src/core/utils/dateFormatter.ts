/**
 * Date formatting utility functions
 */

export const formatDate = (date: string | Date, format: string = "short"): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "long":
      return dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    case "time":
      return dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "datetime":
      return dateObj.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    default:
      return dateObj.toLocaleDateString();
  }
};

export const isOverdue = (dueDate: string | Date): boolean => {
  const dateObj = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return dateObj < new Date();
};

export const getDaysUntilDue = (dueDate: string | Date): number => {
  const dateObj = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  const diff = dateObj.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getRelativeDateText = (dueDate: string | Date): string => {
  const daysLeft = getDaysUntilDue(dueDate);

  if (daysLeft < 0) {
    return `Overdue by ${Math.abs(daysLeft)} day(s)`;
  } else if (daysLeft === 0) {
    return "Due today";
  } else if (daysLeft === 1) {
    return "Due tomorrow";
  } else if (daysLeft <= 7) {
    return `Due in ${daysLeft} days`;
  } else {
    return formatDate(dueDate, "short");
  }
};
