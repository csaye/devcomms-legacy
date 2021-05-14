import './Message.css';

const now = new Date();
const nowDay = now.getDate();
const nowMonth = now.getMonth();
const nowYear = now.getFullYear();
const today = new Date(nowYear, nowMonth, nowDay).setHours(0, 0, 0, 0);
const yesterday = new Date(nowYear, nowMonth, nowDay - 1).setHours(0, 0, 0, 0);

function Message(props) {
  const { text, timestamp } = props.data;

  // returns a datetime string for given datetime
  function getDateTimeString(dateTime) {

    // separate time and date
    const time = dateTime.toLocaleTimeString();
    const date = dateTime.setHours(0, 0, 0, 0);

    // today
    if (date === today) return `${time} today`;
    // yesterday
    else if (date === yesterday) return `${time} yesterday`;
    // past
    else return date.toLocaleDateString();
  }

  return (
    <div className="Message">
      <p>{getDateTimeString(timestamp.toDate())}</p>
      <p>{text}</p>
    </div>
  );
}

export default Message;
