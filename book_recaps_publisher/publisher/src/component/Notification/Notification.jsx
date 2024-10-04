import React from 'react';
import './Notification.scss';

const Notification = () => {
  const notifications = [
    {
      id: 1,
      type: 'Joined New User',
      message: 'New Registration: Finibus Bonorum et Malorum',
      details: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium',
      user: 'Allen Deu',
      time: '24 Nov 2018 at 9:30 AM',
      color: 'green',
    },
    {
      id: 2,
      type: 'Message',
      message: 'Darren Smith sent new message',
      details: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium',
      user: 'Darren',
      time: '24 Nov 2018 at 9:30 AM',
      color: 'orange',
    },
    {
      id: 3,
      type: 'Comment',
      message: 'Arin Ganshiram Commented on post',
      details: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium',
      user: 'Arin Ganshiram',
      time: '24 Nov 2018 at 9:30 AM',
      color: 'purple',
    },
    {
      id: 4,
      type: 'Connect',
      message: 'Jullet Den Connect Allen Depk',
      details: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium',
      user: 'Jullet Den',
      time: '24 Nov 2018 at 9:30 AM',
      color: 'blue',
    },
  ];

  return (
    <div className="notification-container">
      <h1>Notifications</h1>
      {notifications.map((notification) => (
        <div className="notification-card" key={notification.id}>
          <div className="notification-header">
            <span className={`notification-type ${notification.color}`}>{notification.type}</span>
            <span className="notification-close">×</span>
          </div>
          <div className="notification-content">
            <h2>{notification.message}</h2>
            <p>{notification.details}</p>
            <p className="user-name">{notification.user}</p>
          </div>
          <div className="notification-footer">
            <span className="notification-time">{notification.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
