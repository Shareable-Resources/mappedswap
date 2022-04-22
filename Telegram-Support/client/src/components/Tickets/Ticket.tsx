import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
import styles from '../../styles/3-components/Tickets/Ticket.module.scss';
import MyInfo from './MyInfo';
import Chat from './Chat';

function Ticket(props?: any) {
  // const params = useParams<any>();
  // const [ticket, setTicket] = useState<any>();
  // const [msgs, setMsgs] = useState<any>([]);
  // eslint-disable-next-line
  const [selectedTicket, setSelectedTicket] = useState<string>('');

  // useEffect(()=> {
  //     setTicket(props.tickets.find((item: any) => {
  //         return (params && params.ticketId) ? item.id === parseInt(params.ticketId) : null;
  //     }));

  //     axios.get(`http://localhost:8000/tickets/${params.ticketId}/messages`).then((res: any) => {
  //         if (res.status === 200) {
  //             setMsgs(res.data.result);
  //         }
  //     });
  // }, [params.ticketId]);

  // useEffect(()=> {
  //     debugger;
  //     setMsgs([...msgs, ...props.queues.filter((item: any) => item.id==params.ticketId) ]);
  // }, [props.queues]);

  return (
    <div className={styles.ticket_container}>
      {!selectedTicket ? (
        <div className={styles.message}>
          <div className={styles.loading_message}></div>
          {/* <p>Please select a ticket to view conversation.</p> */}
        </div>
      ) : (
        <div className={styles.ticket_chat}>
          <MyInfo />
          <Chat />
        </div>
      )}
      {/* <div>
        {!selectedTicket ? (
          <div className={styles.unselected}>
            <p>Please select a ticket to view conversation.</p>
          </div>
        ) : (
          <>
            <div className='msg'>
              <div>msg</div>
              <ul>
                {msgs.map((item: any) => {
                  return <li key={item.id}>{item.content}</li>;
                })}
              </ul>
            </div>
            <div className='sendMsg'>
              <input type='text' />
              <button>Send</button>
            </div>
          </>
        )}
      </div>
      <div className={styles.no_details}>
        <div>detail - {params.ticketId}</div>
        <div>{ticket ? ticket.chatId : ''}</div>
      </div> */}
    </div>
  );
}

export default Ticket;
