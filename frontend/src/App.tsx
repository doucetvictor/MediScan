import { useState } from 'react';
import { ModeSelector } from './components/ModeSelector';
import { PatientForm } from './components/PatientForm';
import { LaboratoryForm } from './components/LaboratoryForm';
import { StatusMessage } from './components/StatusMessage';
import { useFormSubmission } from './hooks/useFormSubmission';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'patient' | 'laboratory'>(
    'patient'
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { status, error, uploading, onSubmitPatient, onSubmitLaboratory } =
    useFormSubmission();

  // Function to change tab with transition
  const handleTabChange = (newTab: 'patient' | 'laboratory') => {
    if (newTab === activeTab || isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  return (
    <>
      <div id='root' className='container'>
        <div className='brand'>
          <h1 className='main-title'>
            <span className='title-primary'>Medi</span>
            <span className='title-accent'>Scan</span>
          </h1>
          <p className='subtitle'>
            Your go-to platform for secure medical document processing and blood
            test analysis
          </p>
        </div>
        <div className='w-full'>
          <ModeSelector
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isTransitioning={isTransitioning}
          />

          <div className='form-wrapper'>
            {activeTab === 'patient' && (
              <div
                className={`form-container ${isTransitioning ? 'exiting' : ''}`}
              >
                <PatientForm onSubmit={onSubmitPatient} uploading={uploading} />
              </div>
            )}

            {activeTab === 'laboratory' && (
              <div
                className={`form-container ${isTransitioning ? 'exiting' : ''}`}
              >
                <LaboratoryForm
                  onSubmit={onSubmitLaboratory}
                  uploading={uploading}
                />
              </div>
            )}
          </div>
        </div>

        <StatusMessage status={status} error={error} />

        {/* Footer */}
        <footer className='notes text-center'>
          <small>
            Files are sent to the backend endpoint POST /api/upload as
            multipart/form-data for processing blood test results and medical
            documents.
          </small>
        </footer>
      </div>
    </>
  );
}

export default App;
