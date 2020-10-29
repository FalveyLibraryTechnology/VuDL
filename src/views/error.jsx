var React = require('react');

function ErrorMessage(props) {
    return <div><h1>Error {props.message}</h1>
    <h2>{props.error.status}</h2>
    <pre>{props.error.stack}</pre></div>;
}
  
module.exports = ErrorMessage;
