package twittergraph.http

import scala.io._
import javax.servlet.http.{HttpServlet, HttpServletRequest => HSReq, HttpServletResponse => HSResp}

class GetJSON extends HttpServlet {
  override def doGet(req : HSReq, resp : HSResp) = {
    resp.setContentType("application/json")
    val out = resp.getWriter

    val username = Option(req getParameter "user").getOrElse("default").toLowerCase
    Source.fromFile("output/" + username + ".json").getLines.foreach(out write _)
  }
}
