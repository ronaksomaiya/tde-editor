import React from 'react';
import { Group } from './Group';
import { TextEdit } from './TextEdit';
import { FlexBox } from './Box';

const Template = ({
  templateURI,
  handleURIChange,
  handleDescriptionChange,
  description,
  handleCollectionsChange,
  collections,
  handleDirectoriesChange,
  directories,
  handleContextChange,
  context
}) => {
  return (
    <Group title="Template">
      <FlexBox flexDirection="column" gap="1rem" alignItems="stretch">
        <TextEdit label="URI" value={templateURI} onChangeDebounced={handleURIChange} />
        <TextEdit label="Description" type="textarea" rows={3} value={description} onChange={handleDescriptionChange} />
        <TextEdit label="Collections" value={collections?.join(" OR ") || ""} onChange={handleCollectionsChange} />
        <TextEdit label="Directories" value={directories?.join(" OR ") || ""} onChange={handleDirectoriesChange} />
        <TextEdit label="Context" value={context} onChange={handleContextChange} />
      </FlexBox>
    </Group>
  );
};

export default Template;
