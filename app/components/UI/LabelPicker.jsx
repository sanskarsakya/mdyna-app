import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Keyboard, TextInput } from 'grommet';
// import TextInput from 'UI/TextInput';
import Button from 'UI/Button';
import { Label } from 'UI/Labels';
import { Tag, Close } from 'grommet-icons';
// eslint-disable-next-line
import { camelCase } from 'lodash';

import './LabelPicker.scss';

const LabelInput = ({
  onAdd,
  color,
  onChange,
  onRemove,
  value,
  suggestions,
}) => {
  const [currentTag, setCurrentTag] = React.useState('');
  const [box, setBox] = React.useState();
  const boxRef = React.useCallback(setBox, []);

  const updateCurrentTag = (event) => {
    setCurrentTag(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  const onAddTag = (tag) => {
    setCurrentTag('');
    if (onAdd) {
      onAdd(tag);
    }
  };

  const onEnter = () => {
    if (currentTag.length) {
      onAddTag(currentTag);
    }
  };

  const renderValue = () => {
    const titles = [];
    const Labels = [];
    for (let i = 0; i < value.length; i += 1) {
      const v = value[i];
      if (titles.indexOf(v.title) === -1) {
        titles.push(v.title);
        Labels.push(
          <Label
            key={`${v}${i + 0}`}
            color={color}
            onClick={() => {
              onRemove(v);
            }}
            label={(
              <React.Fragment>
                {(v && v.title) || v}
                <Close color="accent-2" size="12px" />
              </React.Fragment>
)}
          />,
        );
      }
    }
    return Labels;
  };
  return (
    <Keyboard onEnter={onEnter}>
      <Box
        direction="row"
        align="center"
        pad={{ horizontal: 'xsmall' }}
        margin="xsmall"
        className="label-picker-input"
        background="accent-1"
        border="all"
        ref={boxRef}
        wrap
      >
        {value.length > 0 && renderValue()}
        <Box flex style={{ minWidth: '120px', color }}>
          <TextInput
            type="search"
            plain
            dropTarget={box}
            suggestions={suggestions}
            onChange={updateCurrentTag}
            value={currentTag}
            autoFocus
            onSelect={(event) => {
              event.stopPropagation();
              onAddTag(event.suggestion);
            }}
          />
        </Box>
      </Box>
    </Keyboard>
  );
};

LabelInput.propTypes = {
  onAdd: PropTypes.func.isRequired,
  color: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array,
  onRemove: PropTypes.func.isRequired,
  suggestions: PropTypes.array,
};
LabelInput.defaultProps = {
  value: [],
  suggestions: [],
  color: '',
};

const LabelPicker = (props) => {
  const {
    globalLabels, cardLabels, onRemove, onAdd, onChange, color,
  } = props;

  const [selectedTags, setSelectedTags] = React.useState(cardLabels);
  const [suggestions, setSuggestions] = React.useState(globalLabels);
  const [inputHidden, toggleInput] = useState(true);

  useEffect(() => {
    setSelectedTags(cardLabels);
  }, [cardLabels]);

  const transformTag = (tag) => {
    const newTag = camelCase(tag);
    return newTag.startsWith('#') ? newTag : `#${newTag}`;
  };

  const onRemoveTag = (tag) => {
    const labelTitle = transformTag(tag.title || tag);
    const removeIndex = selectedTags.map(t => t.title).indexOf(labelTitle);
    const newTags = [...selectedTags];
    if (removeIndex >= 0) {
      newTags.splice(removeIndex, 1);
    }
    onChange(cardLabels.filter(l => l.title !== labelTitle));
    onRemove({ title: labelTitle });
    setSelectedTags(newTags);
  };

  const onAddTag = (tag) => {
    const labelTitle = transformTag(tag);
    const labelTitles = selectedTags.map(t => t.title);

    if (labelTitles.indexOf(labelTitle) === -1) {
      onAdd({ title: labelTitle });
      onChange([...(cardLabels || []), { title: labelTitle }]);
      setSelectedTags([...selectedTags, labelTitle]);
    }
  };

  const onFilterSuggestion = (v) => {
    setSuggestions(
      globalLabels.filter(
        suggestion => suggestion
          && suggestion.toLowerCase().indexOf(v && v.toLowerCase()) >= 0,
      ),
    );
  };

  return (
    <Box flex direction="row" justify="start">
      <Button
        className="label-picker-button"
        onClick={() => toggleInput(!inputHidden)}
        primary
        color="accent-1"
      >
        <Tag color="brand" />
      </Button>
      {!inputHidden && (
        <LabelInput
          placeholder="Search for aliases..."
          suggestions={suggestions.splice(0, 10)}
          plain
          value={selectedTags}
          color={color}
          onRemove={onRemoveTag}
          onAdd={onAddTag}
          onChange={v => onFilterSuggestion(v.target.value)}
        />
      )}
    </Box>
  );
};

LabelPicker.propTypes = {
  globalLabels: PropTypes.array,
  cardLabels: PropTypes.array,
  color: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

LabelPicker.defaultProps = {
  cardLabels: [],
  color: null,
  globalLabels: [''],
};

export default LabelPicker;
