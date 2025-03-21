import React, { useEffect, useState } from 'react';
import Menu from './Menu.js';
import Template from './Template.js';
import SampleDocs from './SampleDocs.js';
import Variables from './Variables.js';
import Views from './Views.js';
import Triples from './Triples.js';
import { getDatabases } from '../apis/databases';
import { buildAuthHeaders } from '../apis/buildAuthHeader';
import { getTemplate, getTemplates, templateExtract, templateInsert, templateValidate } from '../apis/templates';
import { FlexBox } from './Box';
import { notification } from 'antd';
import fileDownload from 'js-file-download';

function defaultTemplate() {
  return {
    template: {
      context: '',
      collections: [],
      directories: []
    }
  };
}

const Editor = (props) => {
  const [contentDBs, setContentDBs] = useState([]);
  const [selectedContentDb, setSelectedContentDb] = useState('select');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateURI, setSelectedTemplateURI] = useState('');
  const [templateJSON, setTemplateJSON] = useState(defaultTemplate());
  const [sampleURIs, setSampleURIs] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [isLoaded, setLoaded] = useState(false);
  const [error, setError] = useState();

  const handleContentDbChange = async (dbName) => {
    setSelectedContentDb(dbName);
    const data = await getTemplates(dbName).catch((error) => {
      console.log(`templates call failed: ${error}`);
      setLoaded(true);
      setError(error);
    });
    setLoaded(true);
    setTemplates(data.templates);
  };

  const handleTemplateChange = async (templateURI) => {
    setSelectedTemplateURI(templateURI);
    const data = await getTemplate(selectedContentDb, templateURI).catch((error) => {
      console.log(`templates call failed: ${error}`);
      setLoaded(true);
      setError(error);
    });
    setLoaded(true);
    setTemplateJSON(data);
  };

  // Template Management (start)
  const handleURIChange = (templateURI) => {
    setSelectedTemplateURI(templateURI);
  };

  const handleDescriptionChange = (description) => {
    let template = templateJSON;
    template.template.description = description;
    setTemplateJSON(template);
  };

  const handleContextChange = (context) => {
    let template = templateJSON;
    template.template.context = context;
    setTemplateJSON(template);
  };

  const handleCollectionChange = (collection) => {
    let template = templateJSON;
    template.template.collections = [collection];
    setTemplateJSON(template);
  };

  const handleDirectoryChange = (directory) => {
    let template = templateJSON;
    template.template.directories = [directory];
    setTemplateJSON(template);
  };
  // Template Management (end)

  const addURI = (contentURI) => {
    setSampleURIs(sampleURIs.concat(contentURI));
  };

  const removeURI = (contentURI) => {
    setSampleURIs((prevURIs) => prevURIs.filter((uri) => uri !== contentURI));
  };

  // View management (start)
  const handleViewChange = (viewIndex, changedView) => {
    let template = templateJSON;
    template.template.rows = template.template.rows.map((view, index) => {
      if (index === viewIndex) {
        return changedView;
      }
      return view;
    });
    setTemplateJSON({ ...template });
  };

  const handleViewDelete = (viewIndex) => {
    const confirm = window.confirm('Are you sure you want to delete?');
    if (confirm) {
      let template = templateJSON;
      template.template.rows = template.template.rows.filter((view, index) => {
        return index !== viewIndex;
      });
      setTemplateJSON({ ...template });
    }
  };

  const handleViewAdd = () => {
    let template = templateJSON;
    template.template.rows = [
      ...(templateJSON.template.rows ? templateJSON.template.rows : []),
      { viewLayout: 'sparse' }
    ];
    setTemplateJSON({ ...template });
  };
  // View management (end)

  // Triples management (start)
  const handleTripleAdd = () => {
    let template = templateJSON;
    template.template.triples = [
      ...(template.template.triples ? template.template.triples : []),
      { subject: { val: '' }, predicate: { val: '' }, object: { val: '' } }
    ];
    setTemplateJSON({ ...template });
  };

  const handleTripleChange = (tripleIndex, changedTriple) => {
    let template = templateJSON;
    template.template.triples = template.template.triples.map((triple, index) => {
      if (index === tripleIndex) {
        return changedTriple;
      }
      return triple;
    });
    setTemplateJSON({ ...template });
  };
  // Triples management (end)

  // Variables management (start)
  const handleVarDelete = (varIndex) => {
    const confirm = window.confirm('Are you sure you want to delete?');
    if (confirm) {
      console.log(`Deleting variable with index ${varIndex}`);
      let template = templateJSON;
      template.template.vars = template.template.vars.filter((currVar, index) => {
        return index !== varIndex;
      });
      setTemplateJSON({ ...template });
    }
  };

  const handleVarAdd = () => {
    let template = templateJSON;
    template.template.vars = [...(template.template.vars ? template.template.vars : []), { name: '', val: '' }];
    setTemplateJSON({ ...template });
  };

  const handleVarMove = (index, direction) => {
    let variables = templateJSON.template.vars;

    // direction < 0 means we're moving a variable up (earlier in the array); direction > 0 means we're moving a
    // variable down (later in the array). Moving `index` later is the same as moving `index + 1` earlier.
    let targetIndex = index;
    if (direction > 0) {
      targetIndex++;
    }

    templateJSON.template.vars = variables
      .slice(0, targetIndex - 1)
      .concat(variables[targetIndex])
      .concat(variables[targetIndex - 1])
      .concat(variables.slice(targetIndex + 1));

    setTemplateJSON({ ...templateJSON });
  };

  const handleVarChange = (varIndex, changedVar) => {
    let template = templateJSON;
    template.template.vars = template.template.vars.map((currVar, index) => {
      if (index === varIndex) {
        return changedVar;
      }
      return currVar;
    });
    setTemplateJSON({ ...template });
  };
  // Variables management (end)

  const handleValidate = async () => {
    try {
      const result = await templateValidate(templateJSON);
      console.log(`This template ${result.valid ? 'is' : 'is not'} valid`);
      let body = `This template ${result.valid ? 'is' : 'is not'} valid`;
      if (!result.valid) {
        body += '\n' + result.message;
        notification.error({
          message: 'Validation',
          description: body
        });
      } else {
        notification.success({
          message: 'Validation',
          description: body
        });
      }
    } catch (error) {
      console.log(`validation call failed: ${error}`);
      setLoaded(true);
      setError(error);
    }
  };

  const handleTemplateExtract = async () => {
    if (sampleURIs.length > 0) {
      console.log('Editor.js; handleTemplateExtract');
      let uriParam = sampleURIs.map((uri) => `uri=${uri}`).join('&');
      try {
        const result = await templateExtract(uriParam, selectedContentDb, templateJSON);
        if (result.success) {
          setExtractedData(result.extracted);

          notification.success({
            message: 'Extraction',
            description: 'Extraction succeeded'
          });
        } else {
          setLoaded(true);
          setError(result.error);
          setExtractedData(null);
          notification.error({
            message: 'Extraction Failed',
            description: result.error.message
          });
        }
      } catch (error) {
        console.log(`extraction call failed: ${error}`);
        setLoaded(true);
        setError(error);
        setExtractedData(null);
        notification.error({
          message: 'Extraction Failed'
        });
      }
    } else {
      notification.warn({
        message: 'Extraction',
        description: 'Add the URI of at least one sample document before running extract'
      });
    }
  };

  const handleTemplateInsert = async () => {
    const confirm = window.confirm('Inserting the template may cause reindexing. Proceed?');
    if (confirm) {
      try {
        const result = await templateInsert(selectedTemplateURI, selectedContentDb, templateJSON);
        if (result.valid) {
          notification.success({
            message: 'Insert',
            description: 'Insert succeeded'
          });
          // If this is a new template, add it to the list of known templates once insert succeeds
          if (!templates.some((item) => item.uri === selectedTemplateURI)) {
            setTemplates([...templates, { uri: selectedTemplateURI, enabled: true }]);
          }
        } else {
          notification.error({
            message: 'Insert',
            description: result.message
          });
          setLoaded(true);
          setError(result.message);
        }
      } catch (error) {
        console.log(`insert call failed: ${error}`);
        notification.error({
          message: 'Insert',
          description: `insert call failed: ${error}`
        });
        setLoaded(true);
        setError(error);
      }
    }
  };

  const handleExport = () => {
    let match = selectedTemplateURI.match(/[^\/]+$/);
    let filename = null;
    if (match) {
      filename = match[0];
    }
    fileDownload(JSON.stringify(templateJSON, null, 2), filename ? filename : 'template.json');
  };

  useEffect(() => {
    const fn = async () => {
      const data = await getDatabases().catch((error) => {
        console.log(`databases call failed: ${error}`);
        setLoaded(true);
        setError(error);
      });
      setLoaded(true);
      if (data) {
        setContentDBs(data);
      }
    };

    fn();
  }, []);

  return (
    <FlexBox width="100%" alignItems="flex-start" margin="2rem 0" gap="4rem" flexWrap="nowrap">
      <div className="left menu">
        <Menu
          contentDBs={contentDBs}
          onContentDbSelected={handleContentDbChange}
          selectedContentDb={selectedContentDb}
          templates={templates}
          onTemplateSelected={handleTemplateChange}
          onTemplateExtract={handleTemplateExtract}
          onTemplateInsert={handleTemplateInsert}
          selectedTemplateURI={selectedTemplateURI}
          handleValidate={handleValidate}
          handleExport={handleExport}
        ></Menu>
      </div>
      <div className="right" style={{ overflowY: 'auto' }}>
        <FlexBox alignItems="stretch" flexDirection="column" gap="2rem">
          <Template
            templateURI={selectedTemplateURI}
            context={templateJSON.template.context}
            collection={templateJSON.template.collections}
            directory={templateJSON.template.directories}
            description={templateJSON.template.description}
            handleURIChange={handleURIChange}
            handleDescriptionChange={handleDescriptionChange}
            handleContextChange={handleContextChange}
            handleCollectionChange={handleCollectionChange}
            handleDirectoryChange={handleDirectoryChange}
          />
          <SampleDocs
            uris={sampleURIs}
            addURI={addURI}
            removeURI={removeURI}
            authHeaders={buildAuthHeaders()}
            contentDB={selectedContentDb}
            template={templateJSON}
          />
          <Variables
            variables={templateJSON.template.vars}
            onVarDelete={handleVarDelete}
            onVarAdd={handleVarAdd}
            onVarMove={handleVarMove}
            onVarChange={handleVarChange}
          />
          <Views
            viewsSpec={templateJSON.template.rows}
            extractedData={extractedData}
            onViewChange={handleViewChange}
            onViewDelete={handleViewDelete}
            onViewAdd={handleViewAdd}
          />
          <Triples
            triplesSpec={templateJSON.template.triples}
            extractedData={extractedData}
            onTripleChange={handleTripleChange}
            onTripleAdd={handleTripleAdd}
          />
        </FlexBox>
      </div>
    </FlexBox>
  );
};

export default Editor;
