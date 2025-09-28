import './Tile.css'

const Tile = ({ tile }) => {
  const { title, html, coordinates } = tile

  // Support both single-cell [row, col] and four-corner [[r0,c0],[r1,c0],[r1,c1],[r0,c1]]
  let startRow, startCol, endRow, endCol
  if (Array.isArray(coordinates[0])) {
    ;[startRow, startCol] = coordinates[0]
    ;[endRow, endCol] = coordinates[2]
  } else {
    ;[startRow, startCol] = coordinates
    endRow = startRow
    endCol = startCol
  }

  const gridStyle = {
    gridRow: `${startRow + 1} / ${endRow + 2}`,
    gridColumn: `${startCol + 1} / ${endCol + 2}`
  }

  return (
    <div className="tile" style={{...gridStyle, minHeight: 'fit-content', height: 'auto'}}>
      <div className="tile-header">
        <h3 className="tile-title">{title}</h3>
      </div>
      <div 
        className="tile-content-wrapper"
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  )
}

export default Tile
