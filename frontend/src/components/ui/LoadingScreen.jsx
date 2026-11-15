const LoadingScreen = () => {
  return (
    <div className="admin-loading-screen" role="status" aria-label="Đang tải">
      <div className="lds-facebook" aria-hidden="true">
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};

export default LoadingScreen;
