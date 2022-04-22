import React from 'react';
import NavItem from '../../../styles/2-layout/NavBar/NavBarNavItem.module.scss';

export type NavBarNavItemProps = { name: string; icon: string; path: string; active: boolean };
export const NavBarNavItem = ({ name, icon, path, active }: NavBarNavItemProps) => {
  return (
    <div className={NavItem.navItem}>
      <div className={active ? `${NavItem.navBarItem} ${NavItem.activeNavBarItem}` : `${NavItem.navBarItem} ${NavItem.inactiveNavBarItem}`}>
        <img height='20px' width='20px' src={icon} alt='nav-icon' />
        <div className={NavItem.navBarName}></div>
        {name}
      </div>
    </div>
  );
};
