import * as React from 'react';
import style from '../../styles/3-components/Tickets/MyTickets.module.scss';

export default function MyTickets() {
  // const [age, setAge] = React.useState('');

  // const handleChange = (event: any) => {
  //   setAge(event.target.value);
  // };

  return (
    <div className={style.main}>
      <div className={style.dropdown}>
        <div className={style.loading_tickets_bar}></div>
      </div>
      <div className={style.loading_ticket_list}></div>
      {/* <div className={style.ticketList}>
        <div className={style.title}>PINNED</div>
        <p>#123456789</p>
        <p>#123456789</p>
      </div> */}
    </div>
  );
}
