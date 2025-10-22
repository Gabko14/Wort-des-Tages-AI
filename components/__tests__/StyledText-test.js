import * as React from 'react';
import renderer from 'react-test-renderer';

import { MonoText } from '../StyledText';

it(`renders correctly`, () => {
  let tree;
  renderer.act(() => {
    tree = renderer.create(<MonoText>Snapshot test!</MonoText>);
  });
  expect(tree.toJSON()).toMatchSnapshot();
});
