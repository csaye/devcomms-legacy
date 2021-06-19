import nodata from '../../img/nodata.svg';
import loading from '../../img/loading.svg';
import './Filler.css';

function Filler(props) {
  // retrieves image for given type
  function getImage(type) {
    switch (type) {
      case 'nodata': return nodata;
      case 'loading': return loading;
      default: return null;
    }
  }

  return (
    <div className="Filler">
      <div>
        <img src={getImage(props.type)} alt={props.type} />
        <h1>{props.message}</h1>
      </div>
    </div>
  );
}

export default Filler;
