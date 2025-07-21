const settings = require('../config/settings');

const getSettings = (req, res) => {
  try {
    const configWithDescriptions = settings.getConfigWithDescriptions();
    res.json(configWithDescriptions);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

const updateSettings = (req, res) => {
  try {
    const updates = req.body;
    
    // Update runtime settings
    for (const [path, value] of Object.entries(updates)) {
      settings.updateRuntime(path, value);
    }
    
    res.json({ 
      success: true, 
      message: 'Settings updated (runtime only)',
      note: 'Restart server to persist changes'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

const saveSettings = (req, res) => {
  try {
    const success = settings.saveToFile();
    if (success) {
      res.json({ success: true, message: 'Settings saved to file' });
    } else {
      res.status(500).json({ error: 'Failed to save settings to file' });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
};

const reloadSettings = (req, res) => {
  try {
    const success = settings.reloadFromFile();
    if (success) {
      res.json({ success: true, message: 'Settings reloaded from file' });
    } else {
      res.status(500).json({ error: 'Failed to reload settings from file' });
    }
  } catch (error) {
    console.error('Error reloading settings:', error);
    res.status(500).json({ error: 'Failed to reload settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  saveSettings,
  reloadSettings
};