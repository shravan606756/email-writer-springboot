import { useState } from 'react'
import axios from 'axios'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Divider
} from '@mui/material'

function App() {
  const [emailContent, setEmailContent] = useState('')
  const [tone, setTone] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedReply, setGeneratedReply] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        'http://localhost:8080/api/email/generate',
        { emailContent, tone }
      )

      setGeneratedReply(
        typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data, null, 2)
      )
    } catch (err) {
      console.error(err)
      setGeneratedReply('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Email Reply Generator
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Paste an email and instantly generate a smart, well-written reply using AI.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Input */}
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Original Email"
            placeholder="Paste the email you received here…"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Tone */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Tone (Optional)</InputLabel>
            <Select
              value={tone}
              label="Tone (Optional)"
              onChange={(e) => setTone(e.target.value)}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="Professional">Professional</MenuItem>
              <MenuItem value="Friendly">Friendly</MenuItem>
              <MenuItem value="Casual">Casual</MenuItem>
              <MenuItem value="Sarcastic">Sarcastic</MenuItem>
            </Select>
          </FormControl>

          {/* Action */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={!emailContent || loading}
            onClick={handleSubmit}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={26} /> : 'Generate Reply'}
          </Button>

          {/* Output */}
          {generatedReply && (
            <>
              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" gutterBottom>
                Generated Reply
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={6}
                value={generatedReply}
                inputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />

              <Box sx={{ textAlign: 'right' }}>
                <Button
                  variant="outlined"
                  onClick={() =>
                    navigator.clipboard.writeText(generatedReply)
                  }
                >
                  Copy to Clipboard
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

export default App
