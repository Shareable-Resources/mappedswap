import React from 'react';
import style from '../../styles/3-components/Tickets/MyInfo.module.scss';

function MyInfo() {
  return (
    <div className={style.main}>
      <div className={style.title}># 123456789</div>
      <div className={style.user_created}>
        <span className={style.section}>
          <span className={style.bold}>Username:</span>
          <span className={style.detail}>mike.ng #12345</span>
        </span>
        <span className={style.section}>
          <span className={style.bold}>Date Created:</span>
          <span className={style.detail}>mm/dd/yyyy @ 08:24pm</span>
        </span>
      </div>
    </div>
  );
}

export default MyInfo;
