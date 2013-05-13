import AssemblyKeys._

name := "twitter-graph"

organization := "w"

version := "1.0.0"

scalaVersion := "2.9.2"

mainClass := Some("com.twitter.scalding.Tool")

resolvers ++= Seq(
  "Apache HBase" at "https://repository.apache.org/content/repositories/releases",
  "Concurrent Maven Repo" at "http://conjars.org/repo",
  "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Twitter Maven Repo" at "http://maven.twttr.com",
  "Maven Repository" at "http://mvnrepository.com/artifact/",
  "releases" at "http://oss.sonatype.org/content/repositories/releases",
  "snapshots" at "http://oss.sonatype.org/content/repositories/snapshots",
  "Sonatype OSS Repo" at "https://oss.sonatype.org/content/groups/scala-tools"
)

libraryDependencies ++= Seq(
  "org.specs2" %% "specs2" % "1.11" % "test",
  "cascading" % "cascading-core" % "2.0.7",
  "cascading" % "cascading-local" % "2.0.7",
  "cascading" % "cascading-hadoop" % "2.0.7",
  "com.twitter" % "maple" % "0.2.5",
  "com.twitter" %% "scalding" % "0.8.2",
  "commons-lang" % "commons-lang" % "2.4",
  "io.netty" % "netty" % "[3.4.6.Final]",
  "org.apache.hbase" % "hbase" % "0.94.3",
  "com.gravity" % "gravity-hpaste" % "0.1.11",
  "org.scalaj" %% "scalaj-time" % "0.6",
  "org.twitter4j" % "twitter4j-core" % "3.0.3",
  "org.eclipse.jetty" % "jetty-webapp" % "7.3.0.v20110203" % "container",
  "org.eclipse.jetty" % "jetty-plus" % "7.3.0.v20110203" % "container",
  "javax.servlet" % "servlet-api" % "2.5" % "provided"
)

scalacOptions ++= Seq("-unchecked", "-deprecation")

seq(assemblySettings: _*)

seq(webSettings: _*)

port in container.Configuration := 8080

mergeStrategy in assembly <<= (mergeStrategy in assembly) { (old) =>
  {
    case _ => MergeStrategy.last // leiningen build files
  }
}

excludedFiles in assembly := { (bases: Seq[File]) =>
  bases.filterNot(_.getAbsolutePath.contains("seshet")) flatMap { base => 
    //Exclude all log4j.properties from other peoples jars
    ((base * "*").get collect {
      case f if f.getName.toLowerCase == "log4j.properties" => f
    }) ++ 
    //Exclude the license and manifest from the exploded jars
    ((base / "META-INF" * "*").get collect {
      case f => f
    })
  }
}
