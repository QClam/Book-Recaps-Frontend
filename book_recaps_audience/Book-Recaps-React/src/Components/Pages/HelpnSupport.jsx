import React from 'react';
import { Container, Box, Grid, Button, Typography} from '@mui/material';
import "../Pages/HelpnSupport.scss";


const HelpnSupport = () => {
  return (
    <div className='Content'>
      {/* Header Section */}
      <Box 
        sx={{ 
          padding: '120px 0',
          textAlign: 'center',
          backgroundImage: 'url("https://www.shutterstock.com/image-vector/young-woman-opening-huge-open-600nw-2299693591.jpg")',     
          backgroundPosition: 'center'
        }}
      >
      </Box>

      {/* Button Section */}
      <Grid container spacing={2} justifyContent="center" sx={{ marginTop: '20px' }}>
        <Grid item>
          <Button variant="outlined">About BookRecaps</Button>
        </Grid>
        <Grid item>
          <Button variant="outlined">Using BookRecaps</Button>
        </Grid>
        <Grid item>
          <Button variant="outlined">Known Issues and Updates</Button>
        </Grid>
        <Grid item>
          <Button variant="outlined">AI at BookRecaps</Button>
        </Grid>
        <Grid item>
          <Button variant="outlined">Get in touch with us</Button>
        </Grid>
      </Grid>

      {/* Promoted Articles Section */}
      <Box sx={{ marginTop: '40px' }}>
        <Typography variant="h6" gutterBottom>
          Promoted articles
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1">What happened to Spaces?</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">We're discontinuing support for Audiobooks</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">You can now find all of our updates in one place!</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Playback keeps stopping on my Android device.</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Go1 acquires BookRecaps!</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">App shows weird behavior?</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">An additional account on your Premium plan: how does it work?</Typography>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default HelpnSupport;
