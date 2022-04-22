import React from 'react';
import styles from '../../styles/3-components/Tickets/ChatInfo.module.scss';

function ChatInfo() {
  return (
    <div className={styles.main}>
      <div className={styles.history_body}>
        <div className={styles.loading_message}></div>
      </div>
    </div>
  );
}

export default ChatInfo;
