import './App.css'
import SearchSuggestion from './components/SearchSuggestion'

const programmingLanguages = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++',
  'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'C#'
];

function App() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>Search Suggestions</h1>
      <SearchSuggestion 
        suggestions={programmingLanguages} 
        placeholder="Search programming languages..."
        onSelect={(value) => console.log('Selected:', value)}
      />
    </div>
  )
}

export default App
