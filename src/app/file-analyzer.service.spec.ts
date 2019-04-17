import { TestBed } from '@angular/core/testing';

import { FileAnalyzerService } from './file-analyzer.service';

describe('FileAnalyzerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileAnalyzerService = TestBed.get(FileAnalyzerService);
    expect(service).toBeTruthy();
  });
});
