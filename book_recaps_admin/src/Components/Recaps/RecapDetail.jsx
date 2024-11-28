import { Box } from '@mui/material'
import React from 'react'
import { useParams } from 'react-router-dom'

function RecapDetail() {

  const {id} = useParams();
  console.log("RecapID: ", id);
  

  return (
    <Box width='80vw'>RecapDetail</Box>
  )
}

export default RecapDetail