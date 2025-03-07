export const formatCurrency = ({
  value,
  sign,
}: {
  value: number;
  sign: string;
}) => {
  return sign + value.toLocaleString();
};
