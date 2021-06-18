import nodata from '../../img/nodata.svg';
import './Filler.css';

function Filler(props) {
  return (
    <div className="Filler">
      <div>
        <img src={nodata} alt="nodata" />
        <h1>{props.message}</h1>
      </div>
    </div>
  );
}

export default Filler;
