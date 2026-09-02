import { describe, expect, it } from 'vitest';
import { parseGitHubInput } from '../src/parseGitHubInput.js';

describe('parseGitHubInput', () => {
  it('parses a full https URL', () => {
    expect(parseGitHubInput('https://github.com/facebook/react')).toEqual({
      type: 'repo',
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('parses a URL without protocol', () => {
    expect(parseGitHubInput('github.com/facebook/react')).toEqual({
      type: 'repo',
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('parses a URL with trailing path segments', () => {
    expect(parseGitHubInput('https://github.com/facebook/react/tree/main/packages')).toEqual({
      type: 'repo',
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('parses a URL with a .git suffix', () => {
    expect(parseGitHubInput('https://github.com/facebook/react.git')).toEqual({
      type: 'repo',
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('parses an SSH remote', () => {
    expect(parseGitHubInput('git@github.com:facebook/react.git')).toEqual({
      type: 'repo',
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('parses owner/repo shorthand', () => {
    expect(parseGitHubInput('facebook/react')).toEqual({
      type: 'repo',
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('parses a bare owner', () => {
    expect(parseGitHubInput('facebook')).toEqual({ type: 'owner', owner: 'facebook' });
  });

  it('parses a bare owner URL', () => {
    expect(parseGitHubInput('https://github.com/facebook')).toEqual({
      type: 'owner',
      owner: 'facebook',
    });
  });

  it('returns null for empty input', () => {
    expect(parseGitHubInput('')).toBeNull();
    expect(parseGitHubInput('   ')).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(parseGitHubInput('https://gitlab.com/facebook/react')).toBeNull();
    expect(parseGitHubInput('a/b/c/d')).toBeNull();
  });
});
