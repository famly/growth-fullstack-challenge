export const parseDate = (dateString: string) => {
  const date = new Date(dateString);
  return date;
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString();
};
