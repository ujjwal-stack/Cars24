// client/src/components/payment/PaymentHistory.js
export const PaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const result = await paymentService.getUserTransactions(params);
      setTransactions(result.data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      completed: 'status-completed',
      pending: 'status-pending',
      failed: 'status-failed',
      refunded: 'status-refunded'
    };
    return statusClasses[status] || '';
  };

  if (loading) {
    return <Loader text="Loading transactions..." />;
  }

  return (
    <div className="payment-history">
      <div className="history-header">
        <h2>Payment History</h2>
        
        <div className="history-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'refunded' ? 'active' : ''}`}
            onClick={() => setFilter('refunded')}
          >
            Refunded
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="no-transactions">
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-card">
              <div className="transaction-car">
                <img 
                  src={transaction.carId.images?.[0]?.url || '/placeholder-car.jpg'}
                  alt="Car"
                  className="transaction-car-image"
                />
                <div className="transaction-car-info">
                  <h4>{transaction.carId.basicInfo.brand} {transaction.carId.basicInfo.model}</h4>
                  <p>{transaction.transactionType}</p>
                </div>
              </div>

              <div className="transaction-details">
                <div className="transaction-amount">
                  ₹{transaction.totalAmount.toLocaleString('en-IN')}
                </div>
                <div className={`transaction-status ${getStatusClass(transaction.status)}`}>
                  {transaction.status}
                </div>
                <div className="transaction-date">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="transaction-actions">
                <button className="btn btn-small btn-outline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;