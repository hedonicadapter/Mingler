class ActionCreators {
  depositMoney = (amount) => {
    return (dispatch) => {
      dispatch({
        type: 'deposit',
        payload: amount,
      });
    };
  };
}

export default new ActionCreators();
