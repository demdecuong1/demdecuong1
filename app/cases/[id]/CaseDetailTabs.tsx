'use client';

/**
 * CaseDetailTabs Component
 * Tabbed interface for case details (Overview, Documents, Activity, History)
 */

import { useState } from 'react';
import { Box, Tabs, Tab, Stack, Typography } from '@mui/material';
import SectionCard from '@/components/SectionCard';
import FieldDisplay from '@/components/FieldDisplay';
import type { Case } from '@/lib/data/cases';
import type { FieldDefinition } from '@/lib/data/fieldDefinitions';

interface CaseDetailTabsProps {
  caseData: Case;
  fieldsBySection: Record<string, FieldDefinition[]>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SECTION_TITLES: Record<string, string> = {
  customer: 'Customer Information',
  device: 'Device Information',
  service: 'Service Details',
  dates: 'Important Dates',
  additional: 'Additional Information',
};

export default function CaseDetailTabs({ caseData, fieldsBySection }: CaseDetailTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 0,
        }}
      >
        <Tab label="Overview" />
        <Tab label="Documents" />
        <Tab label="Activity" />
        <Tab label="History" />
      </Tabs>

      {/* Overview Tab */}
      <TabPanel value={activeTab} index={0}>
        <Stack spacing={3}>
          {/* Render each section */}
          {Object.entries(fieldsBySection).map(([section, fields]) => {
            // Skip if no fields in this section
            if (fields.length === 0) return null;

            return (
              <SectionCard key={section} title={SECTION_TITLES[section] || section}>
                {fields.map((field) => {
                  const value = caseData.data?.[field.key];
                  const isFullWidth = field.data_type === 'textarea';

                  return (
                    <FieldDisplay
                      key={field.key}
                      label={field.label}
                      value={value}
                      fullWidth={isFullWidth}
                    />
                  );
                })}
              </SectionCard>
            );
          })}

          {/* Show message if no dynamic fields */}
          {Object.values(fieldsBySection).every(fields => fields.length === 0) && (
            <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No additional fields available for your role.
            </Typography>
          )}
        </Stack>
      </TabPanel>

      {/* Documents Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Documents feature coming soon
          </Typography>
        </Box>
      </TabPanel>

      {/* Activity Tab */}
      <TabPanel value={activeTab} index={2}>
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Activity feed coming soon
          </Typography>
        </Box>
      </TabPanel>

      {/* History Tab */}
      <TabPanel value={activeTab} index={3}>
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Audit history coming soon
          </Typography>
        </Box>
      </TabPanel>
    </Box>
  );
}
