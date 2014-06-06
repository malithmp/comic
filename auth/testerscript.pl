#!/usr/bin/perl
my @result;
print "Testing signin...";
@result=`curl http://localhost:1337/?querytype=signin`;
print "\n";
