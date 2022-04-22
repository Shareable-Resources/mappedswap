import React, { useState } from 'react';
import { NavBarNavItem, NavBarNavItemProps } from './NavBarNavItem';
import NavIcon from '../../../assets/Images/Icons/placeholder.svg';
import { NavBarTicketButton } from './NavBarTicketButton';
import navBarStyles from '../../../styles/2-layout/NavBar/NavBar.module.scss';
import logo from '../../../assets/Images/logo.png';
import { NavBarOption } from './NavBarOption';

const NavItems: NavBarNavItemProps[] = [
  { name: 'Home', icon: `${NavIcon}`, path: '/1', active: true },
  { name: 'Tickets', icon: `${NavIcon}`, path: '/2', active: false },
  // { name: 'FF2', icon: `${NavIcon}`, path: '/3', active: false },
  // { name: 'FF3', icon: `${NavIcon}`, path: '/4', active: false },
];
export const Navbar = () => {
  const [NavAddresses, setNavAddresses] = useState<NavBarNavItemProps[]>(NavItems);
  const NavBarItemOnClick = (selectedAddress: NavBarNavItemProps) => {
    const newAddresses = NavAddresses.map(address => {
      if (address.path === selectedAddress.path) {
        return { ...address, active: true };
      } else {
        return { ...address, active: false };
      }
    });

    return newAddresses;
  };

  return (
    <div className={navBarStyles.navBarWrap}>
      <div>
        <div className={navBarStyles.navImgWrap}>
          <img className={navBarStyles.navLogo} src={logo} alt='logo' width='100px' height='100px' />
        </div>
        {NavAddresses.map(address => (
          <div onClick={() => setNavAddresses(NavBarItemOnClick(address))} key={address.path}>
            <NavBarNavItem name={address.name} icon={address.icon} path={address.path} active={address.active} />
          </div>
        ))}
        <NavBarTicketButton />
      </div>
      <div className={navBarStyles.navBarOptionsWrap}>
        <NavBarOption name='Settings' icon={NavIcon} />
        <NavBarOption name='Logout' icon={NavIcon} />
      </div>
    </div>
  );
};
