import React, { useState, useMemo } from 'react';

const styles = {
  container: {
    maxWidth: 600,
    margin: '20px auto',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#222',
  },
  title: {
    textAlign: 'center',
    color: '#3a86ff',
    marginBottom: 12,
  },
  searchBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
    alignItems: 'center',
  },
  input: {
    flexGrow: 1,
    padding: 10,
    fontSize: 16,
    borderRadius: 8,
    border: '1.5px solid #ddd',
    transition: 'border-color 0.3s ease',
  },
  select: {
    padding: 10,
    fontSize: 16,
    borderRadius: 8,
    border: '1.5px solid #ddd',
    minWidth: 150,
  },
  button: {
    backgroundColor: '#3a86ff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 16,
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
  },
  buttonDisabled: {
    backgroundColor: '#a1c6ff',
    cursor: 'not-allowed',
  },
  studentList: {
    maxHeight: 280,
    overflowY: 'auto',
    borderTop: '1px solid #eee',
    marginTop: 20,
    paddingTop: 10,
  },
  studentItem: {
    padding: '6px 10px',
    borderBottom: '1px solid #eee',
    fontSize: 15,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    background: 'white',
    borderRadius: 14,
    maxWidth: '90vw',
    width: 320,
    padding: 24,
    boxShadow: '0 10px 40px rgba(58,134,255,0.3)',
    textAlign: 'center',
  },
  modalTitle: {
    marginTop: 0,
    color: '#3a86ff',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#3a86ff',
    color: 'white',
    fontWeight: 600,
    padding: '8px 24px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
  },
  noResultText: {
    color: 'crimson',
    fontWeight: 'bold',
  }
};

function StudentSearchApp() {
  // Initial 10 students
  const initialStudents = [
    { id: 1, name: "Liam Smith" },
    { id: 2, name: "Emma Johnson" },
    { id: 3, name: "Noah Williams" },
    { id: 4, name: "Olivia Brown" },
    { id: 5, name: "William Jones" },
    { id: 6, name: "Ava Garcia" },
    { id: 7, name: "James Miller" },
    { id: 8, name: "Isabella Davis" },
    { id: 9, name: "Oliver Rodriguez" },
    { id: 10, name: "Sophia Martinez" }
  ];

  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMethod, setSearchMethod] = useState("both");
  const [popupData, setPopupData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // For adding new name input
  const [newStudentName, setNewStudentName] = useState("");

  // Linear Search implementation
  const linearSearch = (array, target) => {
    const start = performance.now();
    let index = -1;
    for (let i = 0; i < array.length; i++) {
      if (array[i].name.toLowerCase() === target.toLowerCase()) {
        index = i;
        break;
      }
    }
    const end = performance.now();
    return { index, timeMs: end - start };
  };

  // Binary Search (array sorted by name)
  const binarySearch = (array, target) => {
    const start = performance.now();
    let low = 0;
    let high = array.length - 1;
    let index = -1;
    const targetLower = target.toLowerCase();
    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      let midName = array[mid].name.toLowerCase();
      if (midName === targetLower) {
        index = mid;
        break;
      } else if (midName < targetLower) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    const end = performance.now();
    return { index, timeMs: end - start };
  };

  // Sorted students for binary search
  const sortedStudents = useMemo(() => {
    return [...students].sort((a,b) => a.name.localeCompare(b.name));
  }, [students]);

  const handleSearch = () => {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return;

    setIsSearching(true);
    setTimeout(() => {
      let linearResult, binaryResult;

      if (searchMethod === "linear") {
        linearResult = linearSearch(students, trimmedTerm);
        setPopupData({
          foundMethods: linearResult.index !== -1 ? ["Linear Search"] : [],
          linear: linearResult,
          binary: null,
          originalIndex: linearResult.index !== -1 ? linearResult.index + 1 : null,
          searchedName: trimmedTerm
        });
      } else if (searchMethod === "binary") {
        binaryResult = binarySearch(sortedStudents, trimmedTerm);
        const origIndex = binaryResult.index !== -1 ? students.findIndex(s => s.id === sortedStudents[binaryResult.index].id) : -1;
        setPopupData({
          foundMethods: binaryResult.index !== -1 ? ["Binary Search"] : [],
          linear: null,
          binary: binaryResult,
          originalIndex: origIndex !== -1 ? origIndex + 1 : null,
          searchedName: trimmedTerm
        });
      } else {
        // Both
        linearResult = linearSearch(students, trimmedTerm);
        binaryResult = binarySearch(sortedStudents, trimmedTerm);

        let foundMethods = [];
        if(linearResult.index !== -1) foundMethods.push("Linear Search");
        if(binaryResult.index !== -1) foundMethods.push("Binary Search");

        let posLinear = linearResult.index;
        let posBinary = binaryResult.index !== -1 ? students.findIndex(s => s.id === sortedStudents[binaryResult.index].id) : -1;
        let foundMethodsText = (foundMethods.length === 2 && posLinear === posBinary) ? ["Both"] : foundMethods;

        setPopupData({
          foundMethods: foundMethodsText,
          linear: linearResult,
          binary: binaryResult,
          originalIndex: posLinear !== -1 ? posLinear + 1 : (posBinary !== -1 ? posBinary + 1 : null),
          searchedName: trimmedTerm
        });
      }
      setIsSearching(false);
    }, 50);
  };

  const closePopup = () => {
    setPopupData(null);
  };

  const handleAddStudent = () => {
    const trimmedName = newStudentName.trim();
    if (!trimmedName) return;
    // Generate new id (max current id + 1)
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    setStudents(prev => [...prev, { id: newId, name: trimmedName }]);
    setNewStudentName("");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Student Search App</h1>

      <div style={{...styles.searchBar, marginBottom: 24, flexWrap:'nowrap'}}>
        <input 
          type="text"
          aria-label="Add new student name"
          placeholder="Add new student name"
          value={newStudentName}
          onChange={e => setNewStudentName(e.target.value)}
          onKeyDown={e => { if(e.key === 'Enter') handleAddStudent(); }}
          style={styles.input}
        />
        <button 
          onClick={handleAddStudent}
          disabled={!newStudentName.trim()}
          style={{ 
            ...styles.button, 
            ...( !newStudentName.trim() ? styles.buttonDisabled : {}) 
          }}
          aria-label="Add student button"
          title="Add new student"
        >
          Add
        </button>
      </div>

      <div style={styles.searchBar} role="search">
        <input 
          type="text"
          aria-label="Search student name"
          placeholder="Enter student name to search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => {if(e.key === 'Enter') handleSearch();}}
          disabled={isSearching}
          style={styles.input}
        />
        <select 
          aria-label="Choose search method"
          value={searchMethod}
          onChange={e => setSearchMethod(e.target.value)}
          disabled={isSearching}
          style={styles.select}
        >
          <option value="linear">Linear Search</option>
          <option value="binary">Binary Search</option>
          <option value="both">Both</option>
        </select>
        <button 
          onClick={handleSearch}
          disabled={!searchTerm.trim() || isSearching}
          aria-busy={isSearching}
          style={{ 
            ...styles.button, 
            ...( (!searchTerm.trim() || isSearching) ? styles.buttonDisabled : {}) 
          }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div style={styles.studentList} aria-label="List of students">
        {students.map((student, idx) => (
          <div key={student.id} style={styles.studentItem}>
            {idx + 1}. {student.name}
          </div>
        ))}
      </div>

      {popupData && (
        <div 
          style={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-result-title"
          tabIndex={-1}
          onClick={closePopup}
          onKeyDown={e => { if(e.key === 'Escape') closePopup(); }}
        >
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 id="search-result-title" style={styles.modalTitle}>Search Result</h2>
            <p><strong>Search Term:</strong> {popupData.searchedName}</p>
            {popupData.foundMethods.length === 0 && <p style={styles.noResultText}>No results found.</p>}
            {popupData.foundMethods.length > 0 && <>
              <p><strong>Found By:</strong> {popupData.foundMethods.join(', ')}</p>
              <p><strong>Position (Serial Number):</strong> {popupData.originalIndex}</p>
              {popupData.linear && <p>Linear Search Time: {popupData.linear.timeMs.toFixed(4)} ms</p>}
              {popupData.binary && <p>Binary Search Time: {popupData.binary.timeMs.toFixed(4)} ms</p>}
            </>}
            <button 
              style={styles.modalCloseButton} 
              onClick={closePopup}
              aria-label="Close search result popup"
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#296dcc'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#3a86ff'}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentSearchApp;

