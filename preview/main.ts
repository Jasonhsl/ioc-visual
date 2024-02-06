const startPage = (url?: String) => {
  if (!url) return
  window.dataModel = new ht.DataModel()
  window.graphView = new ht.graph.GraphView(dataModel)
  graphView.addToDOM()
  graphView.setScrollBarColor('#9999994d')

  ht.Default.xhrLoad(url, function (text) {
    var json = ht.Default.parse(text)
    if (json.title) document.title = json.title

    graphView.deserialize(json)
  })
}
export default startPage
