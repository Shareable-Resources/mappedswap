import React from 'react';
import optionStyles from '../../../styles/2-layout/NavBar/NavBarOption.module.scss';

type NavBarOptionProps = { name: string; icon: string };
export const NavBarOption = ({ name, icon }: NavBarOptionProps) => {
  return (
    <div className={optionStyles.navBarOption}>
      <img src={icon} alt='Option' />
      {name}
    </div>
  );
};
