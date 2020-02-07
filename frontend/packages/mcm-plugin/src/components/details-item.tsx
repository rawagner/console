import * as React from 'react';

const NotAvailable = () => <span className="text-secondary">Not available</span>;

export const DetailsItem: React.FC<DetailsItemProps> = ({
  title,
  idValue,
  isNotAvail = false,
  valueClassName,
  children,
}) => (
  <>
    <dt>{title}</dt>
    <dd id={idValue} className={valueClassName}>
      {isNotAvail ? <NotAvailable /> : children}
    </dd>
  </>
);

type DetailsItemProps = {
  title: string;
  idValue?: string;
  isNotAvail?: boolean;
  valueClassName?: string;
  children: React.ReactNode;
};
