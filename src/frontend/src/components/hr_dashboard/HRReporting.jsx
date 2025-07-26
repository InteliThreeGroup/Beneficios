import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChartBar,
  faFileAlt,
  faDownload,
  faCalendarAlt,
  faUsers,
  faCoins,
  faChartLine,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons"

const HRReporting = () => {
  return (
    <div className="hr-reporting-page">
      <div className="reporting-page-header">
        <h2>Reports & Analytics</h2>
        <p>View data and generate reports on benefit usage</p>
      </div>

      <div className="reporting-grid">
        {/* Available Reports Card */}
        <div className="dashboard-card reports-card">
          <div className="card-header">
            <div className="card-icon">
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
            <div>
              <h3>Available Reports</h3>
              <p>Generate detailed reports on benefits</p>
            </div>
          </div>

          <div className="reports-list">
            <div className="report-item">
              <div className="report-info">
                <FontAwesomeIcon icon={faUsers} className="report-icon" />
                <div>
                  <h4>Workers Report</h4>
                  <p>Complete list of workers and their benefits</p>
                </div>
              </div>
              <button className="btn btn-primary report-button" disabled>
                <FontAwesomeIcon icon={faDownload} />
                Generate
              </button>
            </div>

            <div className="report-item">
              <div className="report-info">
                <FontAwesomeIcon icon={faCoins} className="report-icon" />
                <div>
                  <h4>Financial Report</h4>
                  <p>Spending analysis and fund distribution</p>
                </div>
              </div>
              <button className="btn btn-primary report-button" disabled>
                <FontAwesomeIcon icon={faDownload} />
                Generate
              </button>
            </div>

            <div className="report-item">
              <div className="report-info">
                <FontAwesomeIcon icon={faCalendarAlt} className="report-icon" />
                <div>
                  <h4>Monthly Report</h4>
                  <p>Monthly summary of activities and transactions</p>
                </div>
              </div>
              <button className="btn btn-primary report-button" disabled>
                <FontAwesomeIcon icon={faDownload} />
                Generate
              </button>
            </div>
          </div>
        </div>

        
        
        
      </div>
    </div>
  )
}

export default HRReporting
