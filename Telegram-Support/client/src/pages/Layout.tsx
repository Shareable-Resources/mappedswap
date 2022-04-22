import { Outlet } from 'react-router-dom';
import React from 'react';
import { Navbar } from 'src/components/Global/NavBar/NavBar';
import layoutStyle from '../styles/4-pages/Layout.module.scss';

function Layout() {
  return (
    <div className={layoutStyle.layoutPage}>
      <Navbar />

      <div className='main'>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
