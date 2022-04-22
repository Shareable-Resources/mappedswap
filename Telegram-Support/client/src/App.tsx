import React from 'react';
import './App.module.scss';
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Login from './pages/User/Login';
import Layout from './pages/Layout';
import TicketLayout from './pages/Ticket/TicketLayout';

// import Dashboard from './components/home/Dashboard';
import Home from './components/Home/Home';
import Ticket from './components/Tickets/Ticket';

function App() {
  const [tickets, setTickets] = useState<any>([]);
  const [queues, setQueues] = useState<any>([]);

  useEffect(() => {
    axios.get('http://localhost:8000/tickets').then(res => {
      if (res.status === 200) {
        setTickets(res.data.result);
      }
    });
  }, []);

  const add = () => {
    /*
    setTickets([...tickets, {
      id:99, 
      chatId:99, 
      status:1, 
      createdAt: "2022-02-21T07:04:08.000Z",
      updatedAt: "2022-02-21T07:04:08.000Z",
      customerId: 1}])    
    */

    setQueues([
      {
        id: 1,
        content: 'testing 123...',
      },
    ]);
  };

  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/' element={<Layout />}>
        <Route path='ticket' element={<TicketLayout add={add} queues={queues} tickets={tickets} />}>
          <Route path=':ticketId' element={<Ticket queues={queues} tickets={tickets} />} />
        </Route>
        {/* <Route index element={<Dashboard />} /> */}
        <Route index element={<Home />} />
      </Route>
      <Route
        path='*'
        element={
          <main>
            <p>NOT FOUND!</p>
          </main>
        }
      ></Route>
    </Routes>
  );
}

export default App;
