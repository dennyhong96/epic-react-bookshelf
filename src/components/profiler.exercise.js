import React from 'react'

import {client} from 'utils/api-client'

let queue = []
setInterval(sendProfileQueue, 5000)
async function sendProfileQueue() {
  if (!queue.length) {
    return await Promise.resolve({success: true})
  }
  const queueToSend = [...queue]
  console.log({queueToSend})
  queue = []
  return await client('profile', {data: queueToSend})
}

export function Profiler({phases, metadata, ...restProps}) {
  const reportProfile = (
    id,
    phase,
    actualDuration,
    baseDuration /* Estimated time to render subtree without memo */,
    startTime /* Time at which react start to render the update */,
    commitTime /* Time at which react updated the dom after render */,
    interactions,
  ) => {
    if (!phases || phases.includes(phase)) {
      queue.push({
        metadata,
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions,
      })
    }
  }

  return <React.Profiler onRender={reportProfile} {...restProps} />
}
