package twittergraph.http

import java.io.File
import scala.io._
import javax.servlet.http.{HttpServlet, HttpServletRequest => HSReq, HttpServletResponse => HSResp}

class GetJSON extends HttpServlet {
  override def doGet(req : HSReq, resp : HSResp) = {
    resp.setContentType("application/json")
    val out = resp.getWriter
    val default = "default"

    val username = Option(req getParameter "user").getOrElse(default).toLowerCase

    if (new File(pathToJson(username)).isFile) 
      Source.fromFile(pathToJson(username)).getLines.foreach(out write _)
    else
      Source.fromFile(pathToJson(default)).getLines.foreach(out write _)
  }

  def pathToJson(username: String): String = "output/" + username + ".json"
}
