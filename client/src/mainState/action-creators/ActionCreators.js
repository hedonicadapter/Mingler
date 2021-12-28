class ActionCreators {
  setUser = (user) => {
    return (dispatch) => {
      dispatch({
        type: 'setUser',
        payload: user,
      });
    };
  };
}

export default new ActionCreators();
